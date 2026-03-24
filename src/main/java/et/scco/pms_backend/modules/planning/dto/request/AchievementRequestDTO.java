package et.scco.pms_backend.modules.planning.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class AchievementRequestDTO {

    private Long colorCodingId;
    private String senderFeedback;
    private String reviewerFeedback;
    private List<LocationDTO> locations;  // List of lat/lng objects

    

}
