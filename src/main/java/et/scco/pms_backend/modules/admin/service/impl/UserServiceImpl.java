package et.scco.pms_backend.modules.admin.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.admin.mapper.UserMapper;
import et.scco.pms_backend.modules.admin.model.Roles;
import et.scco.pms_backend.modules.admin.repository.RoleRepository;
import et.scco.pms_backend.modules.admin.repository.UserRepository;
import et.scco.pms_backend.modules.admin.service.UserService;

@Service
@AllArgsConstructor
public class UserServiceImpl  implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final EmployeeServiceImpl employeeService;

    @Override
    public UserResponseDTO createUser(UserCreateRequest userRequestDTO)
    {
        if (userRepository.existsByEmployee_Id(userRequestDTO.getEmployeeId())){
            throw new RuntimeException("User already exists");
        }

        Employee employee = employeeService.findEmployee(userRequestDTO.getEmployeeId());
        User user = UserMapper.mapToUser(userRequestDTO, employee);

        // Encode password
        user.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));

        // Assign roles
        if (userRequestDTO.getRoleIds() != null) {
            List<Roles> roles = roleRepository.findAllById(userRequestDTO.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }


        User savedUser = userRepository.save(user);

        return UserMapper.mapToUserDTO(savedUser);
    }

    @Override
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is Not found with given id: " + userId));
        return UserMapper.mapToUserDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(UserMapper::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO updateUser(Long userId, UserCreateRequest userRequestDTO) {
        User user = userRepository.findById(userId)
        .orElseThrow(() ->
                new ResourceNotFoundException("User is not Exist with given id:" + userId));

        // Update fields
        user.setUsername(userRequestDTO.getUsername());
        if (userRequestDTO.getPassword() != null && !userRequestDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        }

        user.setRoles(new HashSet<>(roleRepository.findAllById(userRequestDTO.getRoleIds())));
        User updateduUser = userRepository.save(user);
        return UserMapper.mapToUserDTO(updateduUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getUserType().equals(UserType.SYSTEM)){
            return;
        }
        userRepository.delete(user);
    }


    @Override
    public String getCityOfficeHeadUserName(){
        List<User> users = userRepository.findAllByRolesIn(
                Set.of(roleRepository.findByRoleName("ROLE_CITY_OFFICE_HEAD").orElseThrow())
        );
        
        if (users == null){
            return null;
        }
        return users.getFirst().getUsername();
    }
}
