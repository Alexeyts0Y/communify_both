package com.communify.communify.service;

import com.communify.communify.dto.PaginatedResult;
import com.communify.communify.dto.post.PostResponseDto;
import com.communify.communify.entity.Like;
import com.communify.communify.entity.Post;
import com.communify.communify.entity.User;
import com.communify.communify.repository.LikeRepository;
import com.communify.communify.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import org.apache.mahout.cf.taste.common.NoSuchUserException;
import org.apache.mahout.cf.taste.common.TasteException;
import org.apache.mahout.cf.taste.impl.common.FastByIDMap;
import org.apache.mahout.cf.taste.impl.common.FastIDSet;
import org.apache.mahout.cf.taste.impl.model.GenericBooleanPrefDataModel;
import org.apache.mahout.cf.taste.impl.neighborhood.ThresholdUserNeighborhood;
import org.apache.mahout.cf.taste.impl.recommender.GenericUserBasedRecommender;
import org.apache.mahout.cf.taste.impl.similarity.LogLikelihoodSimilarity;
import org.apache.mahout.cf.taste.model.DataModel;
import org.apache.mahout.cf.taste.neighborhood.UserNeighborhood;
import org.apache.mahout.cf.taste.recommender.RecommendedItem;
import org.apache.mahout.cf.taste.recommender.Recommender;
import org.apache.mahout.cf.taste.similarity.UserSimilarity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final LikeService likeService;

    private DataModel dataModel;
    private Recommender recommender;
    private boolean recommenderReady = false;

    @PostConstruct
    @Transactional(readOnly = true)
    public void initializeRecommenderModel() {
        logger.info("Initializing recommender system model at application startup...");
        try {
            List<Like> allLikes = likeRepository.findAll();
            if (allLikes.isEmpty()) {
                logger.warn("No likes data found in the database during startup. Recommender cannot be built.");
                this.dataModel = new GenericBooleanPrefDataModel(new FastByIDMap<>());
                this.recommender = null;
                this.recommenderReady = false;
                return;
            }

            FastByIDMap<FastIDSet> userItemPreferences = new FastByIDMap<>();
            for (Like like : allLikes) {
                if (like.getUser() == null || like.getPost() == null) {
                    logger.warn("Like record with ID {} has null user or post during startup, skipping.", like.getId());
                    continue;
                }
                long userId = like.getUser().getId();
                long postId = like.getPost().getId();

                FastIDSet userLikes = userItemPreferences.get(userId);
                if (userLikes == null) {
                    userLikes = new FastIDSet();
                    userItemPreferences.put(userId, userLikes);
                }
                userLikes.add(postId);
            }

            if (userItemPreferences.isEmpty()) {
                logger.warn("User preferences map is empty even after processing {} likes during startup. Check data integrity or processing logic.", allLikes.size());
                this.dataModel = new GenericBooleanPrefDataModel(new FastByIDMap<>());
                this.recommender = null;
                this.recommenderReady = false;
                return;
            }

            logger.info("Building DataModel with {} users and their preferences at startup.", userItemPreferences.size());

            this.dataModel = new GenericBooleanPrefDataModel(userItemPreferences);

            UserSimilarity similarity = new LogLikelihoodSimilarity(this.dataModel);

            // UserNeighborhood neighborhood = new NearestNUserNeighborhood(10, similarity, this.dataModel);
            UserNeighborhood neighborhood = new ThresholdUserNeighborhood(0.1, similarity, this.dataModel);


            this.recommender = new GenericUserBasedRecommender(this.dataModel, neighborhood, similarity);
            this.recommenderReady = true;
            logger.info("Recommender system model built successfully at startup. Model has {} users and {} items.", this.dataModel.getNumUsers(), this.dataModel.getNumItems());

        } catch (TasteException e) {
            logger.error("TasteException while building recommender model at startup: {}", e.getMessage(), e);
            this.recommenderReady = false;
        } catch (Exception e) {
            logger.error("Unexpected exception while building recommender model at startup: {}", e.getMessage(), e);
            this.recommenderReady = false;
        }
    }

    public Page<PostResponseDto> getRecommendedPosts(Long userId, Pageable pageable, User currentUser) {
        PaginatedResult<PostResponseDto> paginatedResult = getCachedRecommendedPosts(userId, pageable, currentUser);

        if (paginatedResult == null) {
            return Page.empty(pageable);
        }

        return new PageImpl<>(paginatedResult.getContent(), pageable, paginatedResult.getTotalElements());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "userRecommendations", key = "{#userId, #pageable.pageNumber, #pageable.pageSize, #currentUser.id}")
    public PaginatedResult<PostResponseDto> getCachedRecommendedPosts(Long userId, Pageable pageable, User currentUser) {
        if (!recommenderReady || this.recommender == null) {
            logger.warn("Recommender is not ready or not built. Returning empty recommendations for user {}.", userId);
            return new PaginatedResult<>(Collections.emptyList(), 0);
        }

        try {
            try {
                if (this.dataModel.getPreferencesFromUser(userId) == null || this.dataModel.getPreferencesFromUser(userId).length() == 0) {
                    logger.info("User {} has no preferences in the model. Returning empty recommendations.", userId);
                    return new PaginatedResult<>(Collections.emptyList(), 0);
                }
            } catch (NoSuchUserException e) {
                logger.info("User {} not found in the recommendation model. Returning empty recommendations.", userId);
                return new PaginatedResult<>(Collections.emptyList(), 0);
            }

            int numberOfRecommendationsToFetch = pageable.getPageSize() * 3;
            if (numberOfRecommendationsToFetch == 0) numberOfRecommendationsToFetch = 30;

            logger.debug("Requesting {} recommendations for user {}.", numberOfRecommendationsToFetch, userId);
            List<RecommendedItem> mahoutRecommendations = this.recommender.recommend(userId, numberOfRecommendationsToFetch);

            if (mahoutRecommendations.isEmpty()) {
                logger.info("No recommendations generated by Mahout for user {}.", userId);
                return new PaginatedResult<>(Collections.emptyList(), 0);
            }

            List<Long> recommendedPostIds = mahoutRecommendations.stream()
                    .map(RecommendedItem::getItemID)
                    .collect(Collectors.toList());

            List<Post> recommendedPostsFromDb = postRepository.findAllById(recommendedPostIds);

            Map<Long, Post> postMap = recommendedPostsFromDb.stream()
                    .collect(Collectors.toMap(Post::getId, post -> post));

            List<PostResponseDto> sortedRecommendedPosts = recommendedPostIds.stream()
                    .map(postMap::get)
                    .filter(Objects::nonNull)
                    .map(post -> PostResponseDto.toDto(post, likeService.hasUserLikedPost(post.getId(), currentUser)))
                    .collect(Collectors.toList());

            int start = (int) pageable.getOffset();
            if (start >= sortedRecommendedPosts.size()) {
                logger.debug("Requested page offset {} is beyond the number of available recommendations ({}). Returning empty page.", start, sortedRecommendedPosts.size());
                return new PaginatedResult<>(Collections.emptyList(), sortedRecommendedPosts.size());
            }
            int end = Math.min((start + pageable.getPageSize()), sortedRecommendedPosts.size());

            List<PostResponseDto> paginatedRecommendations = sortedRecommendedPosts.subList(start, end);
            logger.info("Returning {} recommendations for user {} (page {} of {}).", paginatedRecommendations.size(), userId, pageable.getPageNumber(), sortedRecommendedPosts.size());

            return new PaginatedResult<>(paginatedRecommendations, sortedRecommendedPosts.size());

        } catch (NoSuchUserException e) {
            logger.warn("User {} not found in recommendation model during recommendation generation (should have been caught earlier).", userId);
            return new PaginatedResult<>(Collections.emptyList(), 0);
        } catch (TasteException e) {
            logger.error("TasteException while generating recommendations for user {}: {}", userId, e.getMessage(), e);
            return new PaginatedResult<>(Collections.emptyList(), 0);
        } catch (Exception e) {
            logger.error("Unexpected error while generating recommendations for user {}: {}", userId, e.getMessage(), e);
            return new PaginatedResult<>(Collections.emptyList(), 0);
        }
    }
}