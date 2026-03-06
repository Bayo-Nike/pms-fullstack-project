package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    City getCityById(Long id);
}