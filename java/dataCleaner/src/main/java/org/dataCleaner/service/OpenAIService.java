package org.dataCleaner.service;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenAIService {

    
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    public String generateResponse(String prompt) throws JSONException {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", "gpt-4o");
            requestBody.put("messages", new JSONArray()
                    .put(new JSONObject().put("role", "system").put("content", "You are a highly accurate data extraction and transformation assistant."))
                    .put(new JSONObject().put("role", "user").put("content", prompt))
            );

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.exchange(OPENAI_URL, HttpMethod.POST, requestEntity, String.class);

            JSONObject responseBody = new JSONObject(response.getBody());
            return responseBody.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");

        } catch (Exception e) {
            return "{\"error\": \"Failed to process request: " + e.getMessage() + "\"}";
        }
    }
}
