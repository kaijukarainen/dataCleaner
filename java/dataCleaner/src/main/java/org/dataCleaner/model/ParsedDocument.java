package org.dataCleaner.model;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class ParsedDocument {
    private List<Map<String, String>> tableData;
    private List<FormField> formData;
    private String rawData;
}