package et.scco.pms_backend.utility;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final String uploadDir = "uploads/";

    public String storeFile(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            return null;
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path path = Paths.get(uploadDir + fileName);

        Files.createDirectories(path.getParent());

        Files.write(path, file.getBytes());

        return fileName;
    }

    public Path getFilePath(String fileName) {
        return Paths.get(uploadDir).resolve(fileName);
    }
 

    // Assuming your upload directory is named "uploads"
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
    
    // Deletes physical files from the directory
    public void deletePhysicalFiles(List<String> fileNames) {
        for (String fileName : fileNames) {
            try { 
                
                Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
                boolean deleted = Files.deleteIfExists(filePath);
                
            } catch (IOException ex) {
                System.err.println("Could not delete file: " + fileName + ". Error: " + ex.getMessage());
            }
        }
    }

    public void saveFileToDisk(MultipartFile file, String fileName) throws IOException {
        // Define root (e.g., "uploads/demands/Client_A")
        Path uploadPath = Paths.get("uploads/demands").normalize();
        
        // Create folders automatically (idempotent)
        Files.createDirectories(uploadPath);

        // Write file
        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
