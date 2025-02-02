package org.dataCleaner.service;

import org.dataCleaner.model.ParsedDocument;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.dataCleaner.util.TextExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class PdfParserService {
    private final TextExtractor textExtractor;

    @Autowired
    public PdfParserService(TextExtractor textExtractor) {
        this.textExtractor = textExtractor;
    }

    public ParsedDocument parsePdf(MultipartFile file) throws IOException {
        ParsedDocument result = new ParsedDocument();

        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            result.setRawData(text);
            result.setTableData(new ArrayList<>());
            result.setFormData(textExtractor.extractFormFields(text));

            return result;
        }
    }
}