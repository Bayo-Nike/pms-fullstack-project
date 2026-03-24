package et.scco.pms_backend.enums;

import lombok.Getter;

@Getter
public enum DivisionGroup {
    BLD ("Building"),
    WAR ("Water and Road"),
    BTH ("Both");

    private final String name;

    DivisionGroup(String name){
        this.name = name;
    }
}
