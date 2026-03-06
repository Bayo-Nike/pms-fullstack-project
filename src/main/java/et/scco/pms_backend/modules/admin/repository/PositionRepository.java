package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Position> findByNameIgnoreCase(String parentName);

    boolean existsByNameIgnoreCaseAndDivisionId(String name, Long divisionId);
}
