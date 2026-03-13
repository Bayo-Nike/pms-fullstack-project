package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.request.MobileUserRequestDto;
import et.scco.pms_backend.modules.admin.dto.request.MobileVerifyRequest;
import et.scco.pms_backend.modules.admin.dto.response.MobileUserResponseDto;
import et.scco.pms_backend.modules.admin.mapper.UserMapper;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.MobileUser;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.EmployeeRepository;
import et.scco.pms_backend.modules.admin.repository.MobileUserRepository;
import et.scco.pms_backend.modules.admin.service.MobileUserService;
import et.scco.pms_backend.modules.auth.AuthResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MobileUserServiceImpl implements MobileUserService {

    private final MobileUserRepository mobileUserRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public MobileUserResponseDto registerMobileUser(MobileUserRequestDto dto) {
        if (mobileUserRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new RuntimeException("Employee already has a registered mobile device.");
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        MobileUser mobileUser = new MobileUser();
        mobileUser.setEmployee(employee);
        mobileUser.setStatus("ACTIVE");
        mobileUser.setRegistrationDate(LocalDateTime.now());

        // Generate Unique ID using Employee ID as salt
        mobileUser.setUserCode(generateSaltedCode(employee.getId()));

        MobileUser saved = mobileUserRepository.save(mobileUser);
        return mapToDto(saved);
    }

    @Override
    public List<MobileUserResponseDto> getAllMobileUsers() {
        return mobileUserRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MobileUserResponseDto updateStatus(Long id, String status) {
        MobileUser user = mobileUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mobile user not found"));
        user.setStatus(status);
        return mapToDto(mobileUserRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteMobileUser(Long id) {
        mobileUserRepository.deleteById(id);
    }


    @Transactional
    @Override
    public AuthResponseDto verifyMobileCode(MobileVerifyRequest request) {
        // 1. Find the registration by code
        MobileUser mobileUser = mobileUserRepository.findByUserCode(request.getUserCode())
                .orElseThrow(() -> new BadCredentialsException("Invalid pairing code."));

        // 2. Security Check: Status
        if (!"ACTIVE".equals(mobileUser.getStatus())) {
            throw new BadCredentialsException("This mobile access has been revoked.");
        }

        // 3. Capture Device Details
        mobileUser.setDeviceInfo(request.getDeviceInfo());
        mobileUser.setPairedAt(LocalDateTime.now());
        mobileUserRepository.save(mobileUser);

        // 4. Identity Retrieval
        User user = mobileUser.getEmployee().getUser();
        if (user == null) {
            throw new RuntimeException("No system user account linked to this employee.");
        }

        // 5. Generate JWT Token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                        .toList()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtService.generateToken(authentication);

        return new AuthResponseDto(token, UserMapper.toResponseDto(user));
    }




    private String generateSaltedCode(Long empId) {
        // Simple salted logic: Base64 of (Timestamp + EmpId) taken to 8 chars
        String salt = "SCCO-" + empId + "-" + System.currentTimeMillis();
        String encoded = Base64.getEncoder().encodeToString(salt.getBytes());
        // Remove non-alphanumeric and return the first 8 uppercase
        return encoded.replaceAll("[^A-Za-z0-9]", "").substring(0, 8).toUpperCase();
    }

    private MobileUserResponseDto mapToDto(MobileUser entity) {
        return MobileUserResponseDto.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getFullName())
                .userCode(entity.getUserCode())
                .status(entity.getStatus())
                .registrationDate(entity.getRegistrationDate())
                .build();
    }
}