package org.dataCleaner.util;

import org.dataCleaner.model.FormField;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TextExtractor {
    private static final Pattern FIELD_PATTERN = Pattern.compile("^([^:]+):(.*)$");

    public List<FormField> extractFormFields(String text) {
        List<FormField> fields = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return fields;
        }

        String[] lines = text.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();

            // Try to extract field from colon-separated format
            FormField colonField = extractColonFormat(line);
            if (colonField != null) {
                fields.add(colonField);
                continue;
            }

            // Try to extract field from adjacent lines format
            if (i < lines.length - 1) {
                FormField adjacentField = extractAdjacentFormat(line, lines[i + 1].trim());
                if (adjacentField != null) {
                    fields.add(adjacentField);
                    i++;
                }
            }
        }

        return fields;
    }

    private FormField extractColonFormat(String line) {
        Matcher matcher = FIELD_PATTERN.matcher(line);
        if (matcher.find()) {
            return createFormField(
                    matcher.group(1).trim(),
                    matcher.group(2).trim()
            );
        }
        return null;
    }

    private FormField extractAdjacentFormat(String currentLine, String nextLine) {
        if (isLikelyFieldName(currentLine) && isLikelyFieldValue(nextLine)) {
            return createFormField(currentLine, nextLine);
        }
        return null;
    }

    private FormField createFormField(String key, String value) {
        FormField field = new FormField();
        field.setKey(key);
        field.setValue(value);
        return field;
    }

    private boolean isLikelyFieldName(String text) {
        return text.length() > 2 &&
                Character.isUpperCase(text.charAt(0)) &&
                !text.contains(":") &&
                !text.matches(".*\\d.*");
    }

    private boolean isLikelyFieldValue(String text) {
        return !text.isEmpty() &&
                (text.matches(".*\\d.*") ||
                        text.contains(",") ||
                        text.contains(".") ||
                        text.equals(":unselected:"));
    }
}