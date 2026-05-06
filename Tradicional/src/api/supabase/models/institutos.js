
// Ayuda a crear la estructura del objeto, aunque los tipos no los valida, (esto lo hace la BD)
class Instituto {
    constructor(data) {
        this.IdInstitutoOK = data.id_instituto_ok;
        this.IdInstitutoBK = data.id_instituto_bk;
        this.DesInstituto  = data.des_instituto;
        this.Alias         = data.alias || null;
        this.Matriz        = data.matriz || null;
        this.Giro          = data.giro || null;
        this.IdInstitutoSupOK = data.id_instituto_sup_ok || null;
    }
}



export default Instituto;