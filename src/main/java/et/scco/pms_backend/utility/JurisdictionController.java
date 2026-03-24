package et.scco.pms_backend.utility;

import et.scco.pms_backend.config.ApiResponse;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jurisdiction")
@AllArgsConstructor
public class JurisdictionController {
    private final JurisdictionUtility jurisdictionUtility;

    @GetMapping("/reportees")
    public ApiResponse<List<ReportToResponseDto>>getMyReportees(){
        return ResponseUtil.success(
                "All reportees",
                jurisdictionUtility.myReportees()
        );
    }
}
