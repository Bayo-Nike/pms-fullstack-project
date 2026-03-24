package et.scco.pms_backend.modules.planning.service.impl;

import java.util.List;
import java.util.stream.Collectors;
 
import org.springframework.stereotype.Service;

import et.scco.pms_backend.modules.planning.dto.request.AchievementRequestDTO;
import et.scco.pms_backend.modules.planning.model.AchievementLocation;
import et.scco.pms_backend.modules.planning.model.ColorCoding;
import et.scco.pms_backend.modules.planning.model.ColorCodingDetails;
import et.scco.pms_backend.modules.planning.repository.ColorCodingDetailRepository;
import et.scco.pms_backend.modules.planning.repository.ColorCodingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AchievementServiceImpl { 
    private final ColorCodingRepository colorCodingRepository;
    private final ColorCodingDetailRepository codingDetailRepository;

    @Transactional
    public void submitAchievement(AchievementRequestDTO dto) {
        // 1. Find the Master Target record
        ColorCoding colorCoding = colorCodingRepository.findById(dto.getColorCodingId())
                .orElseThrow(() -> new RuntimeException("Target Registry not found"));

        // 2. Create the Submission Detail record
        ColorCodingDetails colorCodingDetails = new ColorCodingDetails();
        colorCodingDetails.setColorCoding(colorCoding);
        colorCodingDetails.setSenderFeedback(dto.getSenderFeedback());

        // 3. Map the GPS locations from DTO to Entity
        List<AchievementLocation> locations = dto.getLocations().stream().map(locDto -> {
            AchievementLocation loc = new AchievementLocation();
            loc.setLatitude(locDto.getLatitude());
            loc.setLongitude(locDto.getLongitude());
            loc.setColorCodingDetails(colorCodingDetails); // Link to the detail record
            return loc;
        }).collect(Collectors.toList());

        colorCodingDetails.setLocations(locations);

        // 4. CALCULATE NEW TOTAL
        // We take the current achieved count and add the size of the new location list
        long currentTotal = (colorCoding.getAchieved() == null) ? 0 : colorCoding.getAchieved();
        long addedCount = locations.size();
        
        colorCoding.setAchieved(currentTotal + addedCount);
 
        // Saving details will automatically save locations due to CascadeType.ALL
        codingDetailRepository.save(colorCodingDetails); 
        
        // Update the master record with the new total
        colorCodingRepository.save(colorCoding);
    }

    public List<ColorCodingDetails> findByColorCodingIdOrderBySubmittedDateDesc(Long id) {
        return codingDetailRepository.findByColorCodingIdOrderBySubmittedDateDesc(id);
    }

}
