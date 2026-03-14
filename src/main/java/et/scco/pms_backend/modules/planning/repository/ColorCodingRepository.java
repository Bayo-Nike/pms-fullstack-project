package et.scco.pms_backend.modules.planning.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import et.scco.pms_backend.enums.BuildingType;
import et.scco.pms_backend.enums.PlanType;
import et.scco.pms_backend.enums.Quarter;
import et.scco.pms_backend.modules.admin.model.SubCity;
import et.scco.pms_backend.modules.planning.model.ColorCoding;

@Repository
public interface ColorCodingRepository extends JpaRepository<ColorCoding, Long> {

    // Check if a record exists with these specific parameters
    boolean existsByFiscalYearAndPlanTypeAndBuildingTypeAndSubCityAndQuarter(
            String fiscalYear,
            PlanType planType,
            BuildingType buildingType,
            SubCity subCity,
            Quarter quarter);

    boolean existsByFiscalYearAndPlanTypeAndBuildingTypeAndSubCityAndQuarterAndIdNot(
            String fiscalYear,
            PlanType planType,
            BuildingType buildingType,
            SubCity subCity,
            Quarter quarter,
            Long id);

    List<ColorCoding> findBySubCity(SubCity userSubCity);

}
