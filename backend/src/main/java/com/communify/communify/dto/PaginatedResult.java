package com.communify.communify.dto;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResult<T> implements Serializable {
    private static final long serialVersionUID = 1L; // Хорошая практика для Serializable

    private List<T> content;
    private long totalElements;
}
