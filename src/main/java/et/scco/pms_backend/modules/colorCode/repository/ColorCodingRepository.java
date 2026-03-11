package et.scco.pms_backend.modules.colorCode.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import et.scco.pms_backend.modules.colorCode.model.ColorCoding;

@Repository
public interface ColorCodingRepository extends JpaRepository <ColorCoding, Long>{

}
