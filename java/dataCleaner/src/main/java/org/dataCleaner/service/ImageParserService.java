package org.dataCleaner.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.dataCleaner.model.ParsedDocument;
import org.dataCleaner.util.TextExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;

@Service
public class ImageParserService {
    private final Tesseract tesseract;
    private final TextExtractor textExtractor;

    @Autowired
    public ImageParserService(TextExtractor textExtractor) {
        this.textExtractor = textExtractor;
        this.tesseract = new Tesseract();
        // Use the environment variable or fall back to default path
        String tessdataPath = System.getenv("TESSDATA_PREFIX");
        if (tessdataPath == null) {
            tessdataPath = "/usr/share/tesseract-ocr/4.00/tessdata/";
        }
        tesseract.setDatapath(tessdataPath);
    }

    public ParsedDocument parseImage(MultipartFile file) throws IOException, TesseractException {
        ParsedDocument result = new ParsedDocument();

        BufferedImage image = ImageIO.read(file.getInputStream());
        String text = tesseract.doOCR(image);

        result.setRawData(text);
        result.setTableData(new ArrayList<>());
        result.setFormData(textExtractor.extractFormFields(text));

        return result;
    }
}