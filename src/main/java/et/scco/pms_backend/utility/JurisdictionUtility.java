//package et.scco.pms_backend.utility;
//
//import et.scco.pms_backend.enums.UserType;
//import et.scco.pms_backend.modules.admin.dto.response.SubCityResponseDto;
//import et.scco.pms_backend.modules.admin.model.Employee;
//import et.scco.pms_backend.modules.admin.model.Position;
//import et.scco.pms_backend.modules.admin.model.SubCity;
//import et.scco.pms_backend.modules.admin.repository.PositionRepository;
//import et.scco.pms_backend.modules.admin.repository.SubCityRepository;
//import lombok.AllArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@AllArgsConstructor
//public class JurisdictionUtility {
//
//    private final AuthContext authContext;
//    private final SubCityRepository subCityRepository;
//
//    private boolean isSuperAdmin() {
//        return authContext.getUser().getUserType() == UserType.SYSTEM;
//    }
//
//    public List<SubCityResponseDto> getMySubCities()
//    {
//        if (isSuperAdmin()){
//            //return all subcities
//            return List.of();
//        }
//        Employee employee = authContext.getEmployee();
//        SubCity subCity = employee.getSubCity();
//        if (subCity == null){
//            //it could be manager or mayor at city level
//            //return all subcities
//            return List.of();
//        }
//        return List.of(subCityRepository.findById(subCity.getId()));
//    }
//
//    public final PositionRepository positionRepository;
//
//    public List<Position> getListOfPositionsUnderMe()
//    {
//        if (isSuperAdmin()){
//            //return all subcities
//            return List.of();
//        }
//        Employee employee = authContext.getEmployee();
//        Position position = employee.getPosition();
//
//        return positionRepository.findAllByParent_Id(position.getId());
//    }
//}
