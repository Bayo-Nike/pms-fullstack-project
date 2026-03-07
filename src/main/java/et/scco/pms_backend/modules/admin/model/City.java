package et.scco.pms_backend.modules.admin.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class City {

    @Id
    @Column(nullable = false, updatable = false)
    private Long id = 1L;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubCity> subCities = new ArrayList<>();

    public City(long id, String name) {
        this.id = id;
        this.name = name;
    }
}