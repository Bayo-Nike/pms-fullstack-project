package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;

public interface UserService {

    UserResponseDTO createUser(UserCreateRequest userRequestDTO);

    UserResponseDTO getUserById(Long userId);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO updateUser(Long userId, UserCreateRequest userRequestDTO);

    void deleteUser(Long userId);

    String getCityOfficeHeadUserName();

    List<UserResponseDTO> updateUserStatus(Long id, boolean status);
}
