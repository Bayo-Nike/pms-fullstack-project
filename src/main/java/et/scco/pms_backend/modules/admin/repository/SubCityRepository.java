package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.SubCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubCityRepository extends JpaRepository<SubCity, Long> {
    boolean existsBySubCityNameIgnoreCase(String name);
}
