package et.scco.pms_backend.modules.admin.controller;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.request.UserRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.admin.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponseDTO>createUser(@RequestBody UserCreateRequest userRequestDTO){
        UserResponseDTO savedUserResponseDTO = userService.createUser(userRequestDTO);
        return  new ResponseEntity<>(savedUserResponseDTO,HttpStatus.CREATED);

    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponseDTO>getUser(@PathVariable("id") Long userId){
        UserResponseDTO userResponseDTO=userService.getUserById(userId);
        return ResponseEntity.ok(userResponseDTO);

    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>>getAllUsers(){
        List<UserResponseDTO> allUsersDto=userService.getAllUsers();
        return ResponseEntity.ok(allUsersDto);

    }

    @PutMapping("{id}")
    public ResponseEntity<UserResponseDTO>updateUser(@PathVariable("id") Long userId,@RequestBody UserCreateRequest userRequestDTO){
         
        UserResponseDTO userResponseDTO=userService.updateUser(userId,userRequestDTO);
        return ResponseEntity.ok(userResponseDTO);

    }

    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteUser(@PathVariable("id") Long userId){
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully.");
    }
}
