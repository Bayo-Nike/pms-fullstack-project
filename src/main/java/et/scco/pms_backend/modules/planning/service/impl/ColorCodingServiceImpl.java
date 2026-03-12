package et.scco.pms_backend.modules.planning.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.enums.Quarter;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.impl.SubCityServiceImpl;
import et.scco.pms_backend.modules.planning.dto.ColorCodingRequestDTO;
import et.scco.pms_backend.modules.planning.dto.ColorCodingResponseDTO;
import et.scco.pms_backend.modules.planning.mapper.ColorCodingMapper;
import et.scco.pms_backend.modules.planning.model.ColorCoding;
import et.scco.pms_backend.modules.planning.repository.ColorCodingRepository;
import et.scco.pms_backend.modules.planning.service.ColorCodingService;
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

        // 4. Access control logic:  Allow if user's sub-city is null or matches the requested sub-city else deny
        if(userSubCity != null && colorCodingRequestDTO.getSubCityId() > 0
        && !userSubCity.getId().equals(colorCodingRequestDTO.getSubCityId())) {
            throw new RuntimeException("You are not allowed to create a record for another sub-city");
        }

        // 4. Resolve the SubCity Entity
        SubCity targetSubCity = null;
        if(colorCodingRequestDTO.getSubCityId() > 0){
            targetSubCity = subCityServiceImpl.getSubCityEntity(colorCodingRequestDTO.getSubCityId());
            colorCoding.setSubCity(targetSubCity);
        }

        boolean alreadyExists = colorCodingRepository.existsByFiscalYearAndPlanTypeAndBuildingTypeAndSubCityAndQuarter(
            colorCodingRequestDTO.getFiscalYear(),
            colorCoding.getPlanType(),
            colorCoding.getBuildingType(),
            targetSubCity,
            colorCoding.getQuarter());

        if (alreadyExists) {
            String msg = String.format("A color code already exists for %s, %s, %s %s", 
                colorCodingRequestDTO.getFiscalYear(), 
                colorCodingRequestDTO.getBuildingType(),
                colorCodingRequestDTO.getPlanType(),
                colorCoding.getQuarter() != null ? "(" + colorCoding.getQuarter() + ")" : "");
            
            throw new RuntimeException(msg);
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
        // 1. Get the logged-in username
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        // 2. Find the User entity
        User user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));
        // 3. Get user's subCity safely
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;
        List<ColorCoding> colorCodings=new ArrayList<>();

        // 4. Filtering Logic
        if (userSubCity != null) {
            // User belongs to a specific sub-city: filter data
            colorCodings = colorCodingRepository.findBySubCity(userSubCity);
        } else {
            // User has no sub-city (Admin): get everything
            colorCodings = colorCodingRepository.findAll();
        }

        // 5. Map to DTOs
        return colorCodings.stream()
                .map(ColorCodingMapper::mapToColorCodingResponseDTO)
                .collect(Collectors.toList());
            // List<ColorCoding> colorCodings = colorCodingRepository.findAll();
            // return colorCodings.stream().map(ColorCodingMapper::mapToColorCodingResponseDTO)
            //         .collect(Collectors.toList());
    }

    @Override
    public ColorCodingResponseDTO updateColorCode(Long colorCodeId, ColorCodingRequestDTO colorCodingRequestDTO) {
        // 1. Fetch existing record
        ColorCoding colorCoding = colorCodingRepository.findById(colorCodeId)
        .orElseThrow(() -> new ResourceNotFoundException("Color code does not exist with given id: " + colorCodeId));

        // 2. Security Context
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("The Updating User not found"));

        // 3. Access control logic
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;
        if(userSubCity != null && colorCodingRequestDTO.getSubCityId() > 0
        && !userSubCity.getId().equals(colorCodingRequestDTO.getSubCityId())) {
            throw new RuntimeException("You are not allowed to update another sub-city record");
        }

        // 4. Resolve the Target Sub-City (the one being saved)
        SubCity targetSubCity = null;
        if(colorCodingRequestDTO.getSubCityId() > 0){
            targetSubCity = subCityServiceImpl.getSubCityEntity(colorCodingRequestDTO.getSubCityId());
        }

        // 5. Safe Enum Conversion for Quarter: Only parse Quarter if PlanType is QUARTERLY and quarter string is not null/empty
        Quarter quarterValue = null;
        if ("QUARTERLY".equalsIgnoreCase(colorCodingRequestDTO.getPlanType()) && 
            colorCodingRequestDTO.getQuarter() != null && 
            !colorCodingRequestDTO.getQuarter().isEmpty()) {
            quarterValue = Quarter.valueOf(colorCodingRequestDTO.getQuarter());
        }

        // 6. Duplicate Check (Critical: Use targetSubCity and quarterValue)
        boolean alreadyExists = colorCodingRepository.existsByFiscalYearAndPlanTypeAndBuildingTypeAndSubCityAndQuarterAndIdNot(
            colorCodingRequestDTO.getFiscalYear(),
            PlanType.valueOf(colorCodingRequestDTO.getPlanType()),
            BuildingType.valueOf(colorCodingRequestDTO.getBuildingType()),
            targetSubCity,
            quarterValue,
            colorCodeId
        );

        if (alreadyExists) {
            String msg = String.format("Another color code record already exists for %s, %s, %s %s", 
                colorCodingRequestDTO.getFiscalYear(), 
                colorCoding.getBuildingType(),
                colorCoding.getPlanType(),
                colorCoding.getQuarter() != null ? "(" + colorCoding.getQuarter() + ")" : "");
            throw new RuntimeException(msg);
        }

        // 7. Update fields on the entity
        colorCoding.setFiscalYear(colorCodingRequestDTO.getFiscalYear());
        colorCoding.setTarget(colorCodingRequestDTO.getTarget());
        colorCoding.setAchieved(colorCodingRequestDTO.getAchieved());
        colorCoding.setPlanType(PlanType.valueOf(colorCodingRequestDTO.getPlanType()));
        colorCoding.setBuildingType(BuildingType.valueOf(colorCodingRequestDTO.getBuildingType()));
        colorCoding.setQuarter(quarterValue); // Set the safe value (will be null for YEARLY)
        colorCoding.setSubCity(targetSubCity);
        colorCoding.setCity(subCityServiceImpl.getCity());

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
