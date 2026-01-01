

export type AlertType = "sos" | "alert" | "info";

export type AlertItem = {
    id : number;
    type : AlertType;
    message : string;
    time : string;
};

