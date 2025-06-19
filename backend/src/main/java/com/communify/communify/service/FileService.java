package com.communify.communify.service;

import com.communify.communify.config.MinioConfig;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.MinioException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FileService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public String uploadFile(MultipartFile file, String folder) 
    throws MinioException, IOException, NoSuchAlgorithmException, InvalidKeyException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String objectName = folder + "/" + UUID.randomUUID().toString() + extension;

        minioClient.putObject(
            PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

        return objectName;
    }

    public String getFileUrl(String objectName) {
        return String.format("%s/%s/%s", minioConfig.getUrl(), minioConfig.getBucketName(), objectName);
    }

    public String getPresignedUrl(String objectName) 
    throws InvalidKeyException, ErrorResponseException, InsufficientDataException, 
            InternalException, InvalidResponseException, NoSuchAlgorithmException, 
            XmlParserException, ServerException, IllegalArgumentException, IOException {
        Map<String, String> reqParams = new HashMap<String, String>();
        reqParams.put("response-content-type", "application/json");

        String url =
            minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket("communify-images")
                    .object(objectName)
                    .expiry(1, TimeUnit.HOURS)
                    .extraQueryParams(reqParams)
                    .build());
        System.out.println(url);
        return url;
    }

    public String getLoadedFileUrl(String fileName) 
    throws InvalidKeyException, ErrorResponseException, InsufficientDataException, 
    InternalException, InvalidResponseException, NoSuchAlgorithmException, 
    XmlParserException, ServerException, IllegalArgumentException, IOException {
        Map<String, String> reqParams = new HashMap<String, String>();
        reqParams.put("response-content-disposition", "attachment; filename=\"" + fileName + "\"");
        // reqParams.put("response-content-type", "application/octet-stream");
        String url = minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket("communify-images")
                .extraQueryParams(reqParams)
                .object(fileName)
                .expiry(1, TimeUnit.HOURS)
                .build()
        );
        return url;
    }
}
