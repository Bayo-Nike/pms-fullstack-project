package et.scco.pms_backend.utility;

import et.scco.pms_backend.modules.admin.dto.response.PositionResponseDto;
import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
import et.scco.pms_backend.modules.admin.repository.PositionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class JurisdictionUtility {

    private final AuthContext authContext;
    public final PositionRepository positionRepository;




    public List<SubCityResponseDto> getMySubCities() {
        return List.of();
    }


    public List<PositionResponseDto> getListOfPositionsUnderMe() {
        return List.of();
    }
}
