package et.scco.pms_backend.modules.planning.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import et.scco.pms_backend.modules.planning.model.ColorCodingDetails;

public interface ColorCodingDetailRepository extends JpaRepository <ColorCodingDetails, Long>{
    // Fetch history ordered by newest first
    List<ColorCodingDetails> findByColorCodingIdOrderBySubmittedDateDesc(Long colorCodingId);

}
