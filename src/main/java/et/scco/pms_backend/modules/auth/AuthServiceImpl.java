package et.scco.pms_backend.modules.auth;

import et.scco.pms_backend.enums.EmployeeStatus;
import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.mapper.UserMapper;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.utility.AuthContext;
import et.scco.pms_backend.utility.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtService.generateToken(authentication);

        User user = userRepository
                .findByUsernameOrEmail(
                        request.getUsernameOrEmail(),
                        request.getUsernameOrEmail()
                )
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        //check if the user is active
        if (user.getUserType().equals(UserType.EMPLOYEE) && user.getStatus() != EmployeeStatus.ACTIVE) {
            throw new UsernameNotFoundException("User is not active");
        }

        return new AuthResponseDto(token, UserMapper.toResponseDto(user));
    }

    @Override
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);

            Date expiry = jwtService.extractExpiration(jwt);
            LocalDateTime expiryTime = expiry.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            TokenBlacklist blacklist = new TokenBlacklist();
            blacklist.setToken(jwt);
            blacklist.setExpiryTime(expiryTime);

            tokenBlacklistRepository.save(blacklist);
        }
        SecurityContextHolder.clearContext();
    }

    @Override
    public UserResponseLoginDto getProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("Unauthorized: No active session found");
        }

        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserMapper.toResponseDto(user);
    }


    private final AuthContext authContext;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Boolean changePassword(ChangePasswordRequestDto dto) {

        User user = authContext.getUser();
        if (user == null) return false;

        if (passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            userRepository.save(user);
            return true;
        }else{
            throw new RuntimeException("Old password is incorrect");
        }
    }
}