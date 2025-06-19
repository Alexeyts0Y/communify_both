package com.communify.communify.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {
    
    private String message;

    private String url;

    private String date;
}
