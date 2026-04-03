package et.scco.pms_backend.modules.planning.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    long countBySubCity(SubCity subCity);
 
    @Query("SELECT c.subCity.subCityName as name, " +
        "c.fiscalYear as fiscalYear, " +
        "c.buildingType as buildingType, " +
        "c.planType as planType, " +
        "SUM(c.target) as target, " +
        "SUM(c.achieved) as achieved " +
        "FROM ColorCoding c " +
        "GROUP BY c.subCity.subCityName, c.fiscalYear, c.buildingType, c.planType")
    List<Map<String, Object>> getPerformanceBySubCityDetailed();

//     For SubCity User: Get Target vs Achieved grouped by Building Type
    @Query("SELECT c.buildingType as name,"+
        "c.fiscalYear as fiscalYear, " +
        "c.planType as planType, " +    
        "SUM(c.target) as target, SUM(c.achieved) as achieved " +
        "FROM ColorCoding c WHERE c.subCity.id = :subId " +
        "GROUP BY c.buildingType, c.fiscalYear, c.planType")
    List<Map<String, Object>> getPerformanceByBuildingType(@Param("subId") Long subId);

}
