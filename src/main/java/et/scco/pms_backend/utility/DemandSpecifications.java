package et.scco.pms_backend.utility;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.DemandStatus;
import et.scco.pms_backend.modules.demand.model.Demand;

public class DemandSpecifications {

    public static Specification<Demand> withFilters(String search, String category, String status, Long subCityId) {
        return (Root<Demand> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            
            // This list will hold all our individual "WHERE" conditions
            List<Predicate> predicates = new ArrayList<>();

            // 1. Text Search (title OR demandCode)
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                // Predicate for: (LOWER(title) LIKE %pattern% OR LOWER(demandCode) LIKE %pattern%)
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate codeLike = cb.like(cb.lower(root.get("demandCode")), pattern);
                predicates.add(cb.or(titleLike, codeLike));
            }

            // 2. Enum Category Filter
            if (category != null && !category.trim().isEmpty()) {
                try {
                    // Predicate for: category = 'GOVERNMENT'
                    predicates.add(cb.equal(root.get("category"), Category.valueOf(category)));
                } catch (IllegalArgumentException e) {
                    // Handle case where UI sends an invalid enum string
                }
            }

            // 3. Enum Status Filter
            if (status != null && !status.trim().isEmpty()) {
                try {
                    // Predicate for: status = 'PENDING'
                    predicates.add(cb.equal(root.get("status"), DemandStatus.valueOf(status)));
                } catch (IllegalArgumentException e) {
                    // Handle case where UI sends an invalid enum string
                }
            }

            // 4. SubCity ID Filter (Joining with another table)
            if (subCityId != null) {
                // Predicate for: sub_city_id = 12
                predicates.add(cb.equal(root.get("subCity").get("id"), subCityId));
            }

            // Combine all predicates with "AND"
            // If the list is empty, it returns all records.
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
