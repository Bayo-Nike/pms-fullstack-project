package et.scco.pms_backend.enums;

public enum ProjectType {

    BUILDING("Building"),
    WATER_AND_ROAD("Water and Road");

    private final String displayName;

    ProjectType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}