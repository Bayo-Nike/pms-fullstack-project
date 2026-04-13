package et.scco.pms_backend.modules.planning.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.impl.NotificationServiceImpl;
import et.scco.pms_backend.modules.admin.service.impl.UserServiceImpl;
import et.scco.pms_backend.modules.auth.AuthUtility;
import et.scco.pms_backend.modules.planning.dto.request.AchievementRequestDTO;
import et.scco.pms_backend.modules.planning.model.AchievementLocation;
import et.scco.pms_backend.modules.planning.model.ColorCoding;
import et.scco.pms_backend.modules.planning.model.ColorCodingDetails;
import et.scco.pms_backend.modules.planning.repository.ColorCodingDetailRepository;
import et.scco.pms_backend.modules.planning.repository.ColorCodingRepository;
import et.scco.pms_backend.utility.AuthContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AchievementServiceImpl {
    private final ColorCodingRepository colorCodingRepository;
    private final ColorCodingDetailRepository codingDetailRepository;
    private final UserRepository userRepository;
    private final NotificationServiceImpl notificationServiceImpl;
    private final UserServiceImpl userServiceImpl;
    private final AuthContext authContext;

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
        // 5. Security Context
        String currentUsername = AuthUtility.getUserName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("The Updating User not found"));

        // 6. Access control logic
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;
        if (userSubCity != null) {
            // colorCodingDetails.setSubmittedBy(user);
        }

        // Saving details will automatically save locations due to CascadeType.ALL
        codingDetailRepository.save(colorCodingDetails);

        // Update the master record with the new total
        colorCodingRepository.save(colorCoding);

        // send notification to City Office Head
        String cityOfficeHeadUserName = userServiceImpl.getCityOfficeHeadUserName();
        User userCityHeadOffice = userRepository.findByUsername(cityOfficeHeadUserName)
                .orElseThrow(() -> new RuntimeException("City Office Head User not found"));

        Employee employee = userCityHeadOffice.getEmployee();

        if (colorCodingDetails != null) {
            notificationServiceImpl.sendNotification(
                    authContext.getEmployee().getId(),
                    employee.getId(),
                    userSubCity.getSubCityName() + " has been Submitted Color Coding Achievement to you",
                    "planning/ColorCodings/details/" + colorCoding.getId());
        }
    }

    public List<ColorCodingDetails> findByColorCodingIdOrderBySubmittedDateDesc(Long id) {
        return codingDetailRepository.findByColorCodingIdOrderBySubmittedDateDesc(id);
    }

    @Transactional
    public void updateAchievement(Long detailId, AchievementRequestDTO dto) {
        // 1. Find existing submission
        ColorCodingDetails details = codingDetailRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        ColorCoding master = details.getColorCoding();

        // 2. Adjust the Master "Achieved" count
        // New Total = (Old Master Total - Old Batch Size) + New Batch Size
        long oldBatchSize = details.getLocations().size();
        long newBatchSize = dto.getLocations().size();

        long currentTotal = (master.getAchieved() == null) ? 0 : master.getAchieved();
        master.setAchieved((currentTotal - oldBatchSize) + newBatchSize);

        // 3. Update Detail fields
        details.setSenderFeedback(dto.getSenderFeedback());
        details.setReviewerFeedback(dto.getReviewerFeedback());

        // 4. Update Locations (Clear old, add new)
        // This is easier than trying to match existing IDs
        details.getLocations().clear();

        List<AchievementLocation> newLocations = dto.getLocations().stream().map(locDto -> {
            AchievementLocation loc = new AchievementLocation();
            loc.setLatitude(locDto.getLatitude());
            loc.setLongitude(locDto.getLongitude());
            loc.setColorCodingDetails(details);
            return loc;
        }).collect(Collectors.toList());

        details.getLocations().addAll(newLocations);

        // 5. Security Context
        String currentUsername = AuthUtility.getUserName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("The Updating User not found"));

        // 6. Access control logic
        SubCity userSubCity = user.getEmployee() != null ? user.getEmployee().getSubCity() : null;
        if (userSubCity != null) {
            // details.setSubmittedBy(user);
        }

        // 7. Save changes
        codingDetailRepository.save(details);
        colorCodingRepository.save(master);

        // send notification to City Office Head
        if (userSubCity != null) {
            String cityOfficeHeadUserName = userServiceImpl.getCityOfficeHeadUserName();
            User userCityHeadOffice = userRepository.findByUsername(cityOfficeHeadUserName)
                    .orElseThrow(() -> new RuntimeException("City Office Head User not found"));

            Employee employee = userCityHeadOffice.getEmployee();

            if (details != null) {
                notificationServiceImpl.sendNotification(
                        authContext.getEmployee().getId(),
                        employee.getId(),
                        userSubCity.getSubCityName() + " has been Submitted Updated Color Coding Achievement to you",
                        "planning/ColorCodings/details/" + master.getId());
            }
        }

    }

}
