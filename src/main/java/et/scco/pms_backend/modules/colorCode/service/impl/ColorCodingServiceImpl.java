package et.scco.pms_backend.modules.colorCode.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.colorCode.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.colorCode.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.colorCode.mapper.ColorCodingMapper;
import et.scco.pms_backend.modules.colorCode.model.ColorCoding;
import et.scco.pms_backend.modules.colorCode.repository.ColorCodingRepository;
import et.scco.pms_backend.modules.colorCode.service.ColorCodingService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ColorCodingServiceImpl implements ColorCodingService{

    private final ColorCodingRepository colorCodingRepository;
    private final SubCityServiceImpl subCityServiceImpl;
    private final UserRepository userRepository;

    @Override
    public ColorCodingResponseDTO createColorCodeTarget(ColorCodingRequestDTO colorCodingRequestDTO) {

        ColorCoding colorCoding = ColorCodingMapper.mapToColorCoding(colorCodingRequestDTO);
        colorCoding.setCity(subCityServiceImpl.getCity());

        // 1. Get the logged-in username from Security Context
        String currentUsername = SecurityContextHolder
            .getContext().getAuthentication().getName();

        // 2. Find the User entity
        User user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("The Creating User not found"));

        // 3. Get user's subCity safely
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;

        // 4. Access control logic
        // Allow if user's sub-city is null or matches the requested sub-city
        if(userSubCity != null && colorCodingRequestDTO.getSubCityId() > 0
        && !userSubCity.getId().equals(colorCodingRequestDTO.getSubCityId())) {
            throw new RuntimeException("You are not allowed to create a record for another sub-city");
        }

        // 5. Set sub-city if provided
        if(colorCodingRequestDTO.getSubCityId() > 0){
            colorCoding.setSubCity(subCityServiceImpl.getSubCityEntity(colorCodingRequestDTO.getSubCityId()));
        }

        colorCoding.setCreatedBy(user); 

        ColorCoding savedColorCode = colorCodingRepository.save(colorCoding);

        return ColorCodingMapper.mapToColorCodingResponseDTO(savedColorCode);
    }

    @Override
    public ColorCodingResponseDTO getColorCodeById(Long colorCodeId) {
        ColorCoding colorCoding = colorCodingRepository.findById(colorCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Color code is Not found with given id: " + colorCodeId));
        return ColorCodingMapper.mapToColorCodingResponseDTO(colorCoding);
    }

    @Override
    public List<ColorCodingResponseDTO> getAllColorCodes() {
        List<ColorCoding> colorCodings = colorCodingRepository.findAll();
        return colorCodings.stream().map(ColorCodingMapper::mapToColorCodingResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ColorCodingResponseDTO updateColorCode(Long colorCodeId, ColorCodingRequestDTO colorCodingRequestDTO) {
        ColorCoding colorCoding = colorCodingRepository.findById(colorCodeId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Color code does not exist with given id: " + colorCodeId));

        // 1. Get the logged-in username from Security Context
        String currentUsername = SecurityContextHolder
            .getContext().getAuthentication().getName();

        // 2. Find the User entity
        User user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("The Updating User not found"));

        // 3. Get user's subCity safely
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;

        // 4. Access control logic: Allow update if user's sub-city is null or matches the requested sub-city; otherwise deny
        if(userSubCity != null && colorCodingRequestDTO.getSubCityId() > 0
        && !userSubCity.getId().equals(colorCodingRequestDTO.getSubCityId())) {
            throw new RuntimeException("You are not allowed to update another sub-city record");
        }

        // 5. Update fields
        colorCoding.setFiscalYear(colorCodingRequestDTO.getFiscalYear());
        colorCoding.setTarget(colorCodingRequestDTO.getTarget());
        colorCoding.setAchieved(colorCodingRequestDTO.getAchieved());
        colorCoding.setPlanType(PlanType.valueOf(colorCodingRequestDTO.getPlanType()));
        colorCoding.setBuildingType(BuildingType.valueOf(colorCodingRequestDTO.getBuildingType()));

        colorCoding.setCity(subCityServiceImpl.getCity());

        if(colorCodingRequestDTO.getSubCityId() > 0){
            colorCoding.setSubCity(subCityServiceImpl.getSubCityEntity(colorCodingRequestDTO.getSubCityId()));
        }

        colorCoding.setCreatedBy(user);

        ColorCoding updatedColorCode = colorCodingRepository.save(colorCoding);
        return ColorCodingMapper.mapToColorCodingResponseDTO(updatedColorCode);
    }

    @Override
    public void deleteColorCode(Long colorCodeId) {
        ColorCoding colorCoding = colorCodingRepository.findById(colorCodeId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Color Code is not Exist with given id:" + colorCodeId));
        colorCodingRepository.delete(colorCoding);
    }
}
