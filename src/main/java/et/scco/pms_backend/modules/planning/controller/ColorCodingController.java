package et.scco.pms_backend.modules.planning.controller;
 
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.planning.dto.request.AchievementRequestDTO;
import et.scco.pms_backend.modules.planning.model.ColorCodingDetails;
import et.scco.pms_backend.modules.planning.service.ColorCodingService;
import et.scco.pms_backend.modules.planning.service.impl.AchievementServiceImpl;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/colorCodes")
public class ColorCodingController {
    private final ColorCodingService colorCodingService;
    private final AchievementServiceImpl achievementServiceImpl;

    // Dynamic Fiscal Year API
    @GetMapping("/fiscal-years")
    public List<String> getFiscalYears() {

        int currentYear = Year.now().getValue();

        List<String> fiscalYears = new ArrayList<>();

        for (int i = -1; i <= 3; i++) { // 1 past, current, 3 future
            int startYear = currentYear + i;
            int endYear = startYear + 1;

            fiscalYears.add(startYear + "/" + endYear);
        }

        return fiscalYears;
    }

     // Build Add Colorcoding REST API
    @PostMapping
    public ApiResponse<ColorCodingResponseDTO> createColorCode(@RequestBody ColorCodingRequestDTO colorCodingRequestDTO) {
        
        ColorCodingResponseDTO savedColorCodingResponseDTO = colorCodingService.createColorCodeTarget(colorCodingRequestDTO);
        return ResponseUtil.success("Color Code created successfully", savedColorCodingResponseDTO);
    }

    // Build Get Colorcoding REST API
    @GetMapping("{id}")
    public ResponseEntity<ColorCodingResponseDTO>getColorCode(@PathVariable("id") Long colorCodeId){
        ColorCodingResponseDTO contractorResponseDTO=colorCodingService.getColorCodeById(colorCodeId);
        return ResponseEntity.ok(contractorResponseDTO);

    }

    // Build Get Colorcoding Details REST API
    @GetMapping("details/{id}")
    public ResponseEntity<ColorCodingResponseDTO>getColorCodeDetails(@PathVariable("id") Long colorCodeId){
        ColorCodingResponseDTO contractorResponseDTO=colorCodingService.getColorCodeById(colorCodeId);
        return ResponseEntity.ok(contractorResponseDTO);

    }


    // Build Get All ColorCodes REST API
    @GetMapping
    public ResponseEntity<List<ColorCodingResponseDTO>>getAllColorCodes(){
        List<ColorCodingResponseDTO> allColorCodesDto=colorCodingService.getAllColorCodes();
        return ResponseEntity.ok(allColorCodesDto);

    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws Exception {
        Path filePath = Paths.get("uploads").resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found " + filename);
        }

        // Try to determine content type
        String contentType = "application/octet-stream";
        if (filename.endsWith(".png")) contentType = "image/png";
        else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (filename.endsWith(".pdf")) contentType = "application/pdf";
        else if (filename.endsWith(".docx")) contentType = "application/docx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // Build Update ColorCode REST API
    @PutMapping(value = "{id}", consumes = "multipart/form-data")
    public ResponseEntity<ColorCodingResponseDTO>updateColorCode(@PathVariable("id") Long colorCodeId,@ModelAttribute ColorCodingRequestDTO colorCodingRequestDTO)throws Exception{
        
        ColorCodingResponseDTO colorCodingResponseDTO =colorCodingService.updateColorCode(colorCodeId,colorCodingRequestDTO);
        return ResponseEntity.ok(colorCodingResponseDTO);
    }

    // Build Delete ColorCode REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteColorCode(@PathVariable("id") Long colorCodeId){
        colorCodingService.deleteColorCode(colorCodeId);
        return ResponseEntity.ok("ColorCode deleted successfully.");
    }

    @PostMapping("/submit-achievement")
    public ResponseEntity<String> submit(@RequestBody AchievementRequestDTO dto) {
        achievementServiceImpl.submitAchievement(dto);
        return ResponseEntity.ok("Achievement saved successfully");
    }  

    @GetMapping("/{id}/achievements")
    public ResponseEntity<List<ColorCodingDetails>> getAchievementHistory(@PathVariable Long id) {
        List<ColorCodingDetails> list = achievementServiceImpl.findByColorCodingIdOrderBySubmittedDateDesc(id);
        return ResponseEntity.ok(list);
    }

}
