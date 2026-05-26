package et.scco.pms_backend.modules.mobile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MobileUserRepository extends JpaRepository<MobileUser, Long> {
    boolean existsByEmployeeId(Long employeeId);
    Optional<MobileUser> findByUserCode(String userCode);
}