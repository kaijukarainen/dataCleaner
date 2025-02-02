package org.dataCleaner.controller;

import org.dataCleaner.model.ParsedDocument;
import org.dataCleaner.service.ImageParserService;
import org.dataCleaner.service.PdfParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class DocumentParserController {

    @Autowired
    private PdfParserService pdfParserService;

    @Autowired
    private ImageParserService imageParserService;

    @PostMapping("/parse")
    public ResponseEntity<ParsedDocument> parseDocument(@RequestParam("file") MultipartFile file) {
        try {
            String contentType = file.getContentType();
            ParsedDocument result;

            if (contentType != null && contentType.startsWith("application/pdf")) {
                result = pdfParserService.parsePdf(file);
            } else if (contentType != null && contentType.startsWith("image/")) {
                result = imageParserService.parseImage(file);
            } else {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}