package et.scco.pms_backend.modules.demand.dto.request;

import et.scco.pms_backend.enums.DemandStatus;
import lombok.Data;

@Data
public class ReviewDemandRequest {
    private DemandStatus status; // APPROVED or REJECTED
    private String reviewerRemark;

}
