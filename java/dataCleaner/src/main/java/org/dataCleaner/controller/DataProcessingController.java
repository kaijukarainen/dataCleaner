package org.dataCleaner.controller;

import org.dataCleaner.service.OpenAIService;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DataProcessingController {

    @Autowired
    private OpenAIService openAIService;

    /**
     * Endpoint to parse raw data and extract structured JSON output.
     */
    @PostMapping("/parse-data")
    public String parseData(@RequestParam("request") String requestData) throws JSONException {
        JSONObject jsonRequest = new JSONObject(requestData);

        if (!jsonRequest.has("data")) {
            return "{\"error\": \"Data field is required in the request.\"}";
        }

        String data = jsonRequest.get("data").toString();
        String prompt = """
        You are an advanced AI specializing in structured data extraction. Your task is to process the following JSON input and return **ONLY** a well-formatted JSON output.

        ### **Transformation Rules**
        1. Extract `formData` into a structured JSON object with clear key-value pairs.
        2. Extract relevant order details from `rawData`, including the following priority fields **if present**:
           - `order_number`
           - `order_date`
           - `reference`
           - `handler`
           - `customer_name`
           - `company`
           - `address`
           - `total_amount`
           - `payment_terms`
           - `late_fee`
           - `business_id`
        3. Convert `rawData` into a structured list called `tableData`, where each row includes the following fields **if they exist**:
           - `item_code`
           - `description`
           - `quantity`
           - `delivery_date`
           - `unit_price`
           - `discount`
           - `net_price`
        4. **Retain any additional fields** from `rawData` that are not explicitly listed above under `"additional_data"`. This ensures all relevant data is preserved.
        5. **Return only the final structured JSON output without any additional text or formatting.**
        
        Given the following input JSON:
        """ + requestData.toString();

        return openAIService.generateResponse(prompt);
    }

    /**
     * Endpoint to map extracted data to a user-defined schema.
     */
    @PostMapping("/map-schema")
    public String mapSchema(@RequestParam("request") String requestData) throws JSONException {
        JSONObject jsonRequest = new JSONObject(requestData);

        if (!jsonRequest.has("schema") || !jsonRequest.has("data")) {
            return "{\"error\": \"Both 'schema' and 'data' fields are required in the request.\"}";
        }

        String schema = jsonRequest.get("schema").toString();
        String extractedData = jsonRequest.get("data").toString();

        String prompt = """
    You are an AI that maps extracted data into a predefined user schema.
    - **Ensure accuracy and proper data alignment.**
    - **Preserve all relevant details.**
    - **Return ONLY a JSON object matching the given schema.**

    ### **Schema Definition**
    """ + schema + """

    ### **Extracted Data**
    """ + extractedData + """

    **Return only the final JSON output that follows the schema format.**
    """;

        return openAIService.generateResponse(prompt);
    }
}
