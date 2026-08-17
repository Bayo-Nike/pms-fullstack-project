package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Roles;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.admin.model.User;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository <User, Long> {

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsernameOrEmail(String username, String email);

    // Option A: Derived Method Name
    long countByEmployeeSubCityId(Long subCityId);

    boolean existsByEmployee_Id(Long employeeId);

    // List<User> findAllByRolesContaining(Set<Roles> roles);
    List<User> findAllByRolesIn(Set<Roles> roles);

    long countByEmployeeClientId(Long subCityId);

    
    
}
