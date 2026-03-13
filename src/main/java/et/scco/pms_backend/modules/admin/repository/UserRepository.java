package et.scco.pms_backend.modules.admin.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import et.scco.pms_backend.modules.admin.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository <User, Long> {

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsernameOrEmail(String username, String email);

    // Option A: Derived Method Name
    long countByEmployeeSubCityId(Long subCityId);

    // Option B: Explicit JPQL (Recommended for clarity)
    // @Query("SELECT COUNT(u) FROM User u WHERE u.employee.subCity.id = :subCityId")
    // long countUsersBySubCity(@Param("subCityId") Long subCityId);
}
