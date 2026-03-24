// package et.scco.pms_backend.modules.planning.model;

// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.FetchType;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.JoinColumn;
// import jakarta.persistence.ManyToOne;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;
// import lombok.Data;

// @Entity
// @Data
// @Table(name = "achievement_locations")
// public class AchievementLocation {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "color_coding_details_id")
//     private ColorCodingDetails colorCodingDetails;

//     @Column(name = "latitude", nullable = false)
//     private Double latitude;

//     @Column(name = "longitude", nullable = false)
//     private Double longitude;

//     @Column(name = "created_date", updatable = false)
//     private LocalDateTime createdDate;

//     @PrePersist
//     public void prePersist() {
//         this.createdDate = LocalDateTime.now();
//     }
// }
