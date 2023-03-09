//supabase link
const SUPABASE_URL = "https://alcxnmulgeyeeavfflnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsY3hubXVsZ2V5ZWVhdmZmbG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc3MDM2NjYsImV4cCI6MTk5MzI3OTY2Nn0.S_3hIKwOLg_amh56TiaJSHQ0tBWrJZMuiMmEArj7Ybk";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//mainīgo definēšna
var izceptoInput = document.getElementById("izceptoInput");
var izejInput = document.getElementById("izejvielasInput");
var daudzInput = document.getElementById("daudzumsInput");

var ul = document.getElementById("list");
var ul2 = document.getElementById("izcepto_list");

var cena;

var miltidaudzums = 0;
var olasdaudzums = 0;
var piensdaudzums = 0;
var elladaudzums = 0;
var izcepto_skaits = 0;

//klases
class Pankukas {
  izceptas;
  datums;

  constructor(izceptas, datums) {
    this.izceptas = izceptas; 
    this.datums = datums;
  }

  pilnsInfo() {
    return "Izceptas- "+this.izceptas+" ("+this.datums+")";
  }
}

class Sastavdalas {
  sastavdala;
  daudzums;
  cena;
  datums;

  constructor(sastavdala, daudzums, cena, datums) {
    this.sastavdala = sastavdala;
    this.daudzums = daudzums;
    this.cena = cena;
    this.datums = datums;

  }

  info() {
    
    var mervieniba = "gab";
    if (this.sastavdala == "milti") {
      mervieniba = "kg";
    };
    if (this.sastavdala == "piens") {
      mervieniba = "l";
    }; 
    if (this.sastavdala == "eļļa") {
      mervieniba = "kg";
    }; 

    return this.sastavdala + " - " + this.daudzums +" "+mervieniba+". Izmaksas - "+this.cena+"€ ("+this.datums+")"; 
  }

}

class Atlikumi extends Sastavdalas {
  izcepto_skaits;

  constructor(sastavdala, daudzums, izcepto_skaits) {
    super(sastavdala, daudzums);
    this.izcepto_skaits = izcepto_skaits;

  }
}

//button savienojumi
var enter_izcepto_Button = document.getElementById("enter_izcepto");
enter_izcepto_Button.addEventListener("click", izceptoSave);

var enter_izejvielu_Button = document.getElementById("enter_izejvielu");
enter_izejvielu_Button.addEventListener("click", save);

//ielāde'datubāzes datus no 2. tabulas
async function loadSecondData() {
  
  const { data, error } = await _supabase.from("Izceptas_pankukas").select();
 //console.log("data2", data);
 data.forEach((element2) => {
   //console.log("elements2", element2.izcepto_skaits, element2.izcepto_id);
   createListElement2(element2.izcepto_skaits, element2.izcepto_datums, element2.izcepto_id);
   izcepto_skaits = izcepto_skaits + element2.izcepto_skaits;
   //console.log(izcepto_skaits);
 });
}
loadSecondData();

//ielādē datubāzes datus
async function loadData() {

  const { data, error } = await _supabase.from("Iepirkumi").select();
  //console.log("data", data);
  data.forEach((element) => {
    //console.log("elements", element.izejviela, element.daudzums, element.cena, element.datums, element.id);
    createListElement(element.izejviela, element.daudzums, element.cena, element.datums, element.id);
    atlikumi(element.izejviela, element.daudzums);
    
  });
}
loadData();

//saglabā ievadīto iepirkumu info datubāzē
async function save() {

    cena = daudzInput.value * 0.26;

    if (izejInput.value == "milti") {
      cena = daudzInput.value* 1.32;
    };
    if (izejInput.value == "piens") {
      cena = daudzInput.value * 1.39;
    }; 
    if (izejInput.value == "eļļa") {
      cena = daudzInput.value * 3.19;
  }; 

  const izejviela = izejInput.value;
  const daudzums = daudzInput.value;
  const _cena = Math.round(cena);
  const datums = new dayjs().format('YYYY-MM-DD');
  
  const { data, error } = await _supabase
    .from("Iepirkumi")
    .insert([{ izejviela: izejviela, daudzums: daudzums, cena: _cena, datums: datums}]);
  loadData();

  izejInput.value = "";
  daudzInput.value = "";
  allUpdate();
}

//saglabā izcepto skaitu un datumu datubāzē
async function izceptoSave() {


  const izcepto_skaits = izceptoInput.value;
  const datums = new dayjs().format('YYYY-MM-DD');
  
  const { data2, error2 } = await _supabase
    .from("Izceptas_pankukas")
    .insert([{izcepto_skaits: izcepto_skaits, izcepto_datums: datums}]);
  loadSecondData();
  
  izceptoInput.value = "";
  allUpdate();
}

//izveido list elementus izejvielu iepirkumu sarakstam
function createListElement(izejviela, daudzums, cena, datums, elementId) {

  //biblioteka
  const newSastavdalas = new Sastavdalas(izejviela, daudzums, cena, datums);
  //console.log("dati", izejviela, daudzums, cena, datums);

  //li element
  var li = document.createElement("li");
  li.setAttribute("data-id", elementId);
  li.appendChild(document.createTextNode(newSastavdalas.info()));
  li.classList.add(
    "list-group-item",
    "d-flex",
    "justify-content-between",
    "align-items-start"
  );
  ul.appendChild(li);
  
  //delete button
  var dBtn = document.createElement("button");
  dBtn.appendChild(document.createTextNode("Dzēst"));
  dBtn.classList.add("btn", "btn-warning", "btn-sm");
  li.appendChild(dBtn);
  dBtn.addEventListener("click", deleteListItem);

  function deleteListItem() {
    li.classList.add("delete");
    remove(elementId);
  }
}

//delete from database
async function remove(elementId) {
const { error } = await _supabase
  .from('Iepirkumi')
  .delete()
  .eq('id', elementId);
  allUpdate();
}

//izveido list elementus izcepto pankūku skaitam
function createListElement2(izcepto_skaits, datums, element2Id) {
  
  //biblioteka
  const newPankukas = new Pankukas(izcepto_skaits, datums);
  //console.log("dati", izcepto_skaits, element2Id);

    var li = document.createElement("li");
    li.setAttribute("data-id", element2Id);
    li.appendChild(document.createTextNode(newPankukas.pilnsInfo()));
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-start",
      "fw-bold"
    );
    ul2.appendChild(li);

  //delete button
  var dBtn = document.createElement("button");
  dBtn.appendChild(document.createTextNode("Dzēst"));
  dBtn.classList.add("ml-2", "btn", "btn-warning", "btn-sm");
  dBtn.addEventListener("click", deleteSecondListItem); 

  li.appendChild(dBtn);
  //delete function
  function deleteSecondListItem() {
    li.classList.add("delete");
    remove2(element2Id);
  }

}

//delete from database
async function remove2(element2Id) {
  const { error } = await _supabase
    .from('Izceptas_pankukas')
    .delete()
    .eq('izcepto_id', element2Id);
  allUpdate();
}

//aprēķina un izvada atlikumus
  function atlikumi(izejviela, daudzums) {

    const newAtlikumi = new Atlikumi(izejviela, daudzums);
    
    console.log(newAtlikumi.sastavdala, newAtlikumi.daudzums, izcepto_skaits);

    if (newAtlikumi.sastavdala == "milti") {
      miltidaudzums = miltidaudzums + newAtlikumi.daudzums - (Math.round(izcepto_skaits * 0.00833333333334 * 100) / 100);
    }
  
    if (newAtlikumi.sastavdala == "olas") {
      olasdaudzums = olasdaudzums + newAtlikumi.daudzums - Math.round(izcepto_skaits * 0.166666666667);
    }

    if (newAtlikumi.sastavdala == "piens") {
      piensdaudzums = piensdaudzums + newAtlikumi.daudzums - (Math.round(izcepto_skaits * 0.025 * 100) / 100);
    }

    if (newAtlikumi.sastavdala == "eļļa") {
      elladaudzums = elladaudzums + newAtlikumi.daudzums - (Math.round(izcepto_skaits * 0.00125 * 100) / 100);
    }
  
    console.log(miltidaudzums, olasdaudzums, piensdaudzums, elladaudzums);

    var milti = document.getElementById("milti");
    milti.innerHTML = "Milti- " + miltidaudzums + " kg.";
    
    var olas = document.getElementById("olas");
    olas.innerHTML = "Olas- " + olasdaudzums + " gab.";

    var piens = document.getElementById("piens");
    piens.innerHTML = "Piens- " + piensdaudzums + " l.";

    var ella = document.getElementById("ella");
    ella.innerHTML = "Eļļa- " + elladaudzums + " kg.";
}
    
//parlādē lapu
function allUpdate() {
  window.location.reload();
}

