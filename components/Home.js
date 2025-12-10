import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'


export default function Home() {

  const [recette, setRecette] = useState ([])
  const [search, setSearch] = useState(""); //filtre par mot clé
  const [result, setResult] = useState([]); // afficher tout au départ
  const [filterType, setFilterType] = useState('')
  const [editMode, setEditMode] = useState(false); //pour gerer le modale de modification
  const [editTitre, setEditTitre] = useState("");
  const [editId, setEditId] = useState(null);


  const typeOptions = [
  { value: "", label: "Choisir un type" },
  { value: "petit déj", label: "petit déj" },
  { value: "entrée", label: "entrée" },
  { value: "plat", label: "plat" },
  { value: "dessert", label: "dessert" },
];

  const [url, setUrl] = useState('')
  const [titre, setTitre] = useState('')
  const [type, setType] = useState ('')
  const [message, setMessage] = useState ('')

  const fetchRecette = () => {
    fetch('https://share-backend-omega.vercel.app/recette')
    .then((res) => res.json())
    .then((data)=> {
      setRecette(data.data)
      setResult(data.data) //permet de tout afficher au chargement de la page
    })
  }

  useEffect(() => {
   fetchRecette()
  }, [])

  const addRecette = () => {
    if(!titre || !url || !type) {
      alert ('Champs manquants');
      return
    } else {
      fetch ('https://share-backend-omega.vercel.app/recette/add', {
        method:'POST',
        headers:{"content-type":"application/json"},
        body : JSON.stringify({
          titre:titre,
          url:url,
          type:type
        })
      })
      .then((res) =>res.json())
      .then((data)=> {
        if(data.result===true) {
          setMessage ('recette ajoutée')
          fetchRecette()
        } else {
          setMessage ('erreur, la recette a déjà été ajouté')
        }
      })
      setTitre('')
      setUrl('')
      setType('')
    }
  }

  const deleteRecette = (id) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
    return; 
  }
    fetch(`https://share-backend-omega.vercel.app/recette/delete/${id}`, {
      method : 'DELETE'
    })
    .then (res => res.json())
    .then(data => {
      if(data.result) {
        fetchRecette();
      }
      
    })
  }

  const updateRecette = (id) => {
    fetch(`https://share-backend-omega.vercel.app/recette/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre: editTitre })
    })
    .then(res => res.json())
    .then(data => {
      if (data.result) {
        fetchRecette();   // recharge les données
        setEditId(null);  // ← ferme le mode édition
        setEditTitre(""); // ← vide le champ
      }
    });
      }

   useEffect(() => {
    let filtered = recette;
    // recherche mot
    if (search.trim() !== "") { //.trim supprime les espaces au début et a la fin du champs de saisi
      filtered = filtered.filter(r =>
        r.titre.toLowerCase().includes(search.toLowerCase())
      );
    }
    // filtre type
    if (filterType !== "") { 
      filtered = filtered.filter(r => r.type === filterType);
    }

    setResult(filtered);
  }, [search, filterType, recette]);

  return (
    <div>
      <div className={styles.add}>
          <input className={styles.reqBody} placeholder='Titre' onChange={(e) => setTitre(e.target.value)} value={titre} />
          <input className={styles.reqBody}  placeholder='url' onChange={(e) => setUrl(e.target.value)} value={url} />
          <select className={styles.reqBody}  value={type} onChange={(e) => setType(e.target.value)}>
                    {typeOptions.map((e, i) => (
                        <option key={i} value={e.value}>
                        {e.label}
                        </option>
                        ))}
            </select>
          <button className={styles.btn} onClick={addRecette}>Ajouter</button>
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? "Terminer" : "Modifier"}
          </button>
        <p>{message}</p>
    </div>

      <div className={styles.add}>
        <input className={styles.reqBody}
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.radio}>
          {typeOptions.map((item, i) => (
            <label key={i} style={{marginRight: "10px"}}>
              <input
                type="radio"
                name="typeFilter"
                value={item.value}
                checked={filterType === item.value}
                onChange={(e) => setFilterType(e.target.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
      
      <div className={styles.recette}>
        {result.map((e,i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardText}>
              <p className={styles.cardTitle}>{e.titre.charAt(0).toUpperCase() + e.titre.slice(1)}</p>
              <p className={styles.cardType}>{e.type}</p>
            </div>
            <Link href={e.url}><a className={styles.cardLink} target='_blank'>Voir la recette</a></Link>

            {editMode && (
              <>
              {editId !==e._id && (
                <button className={styles.btnUpdate} onClick={() => {
                  setEditId(e._id);
                  setEditTitre(e.titre);
                }}><FontAwesomeIcon icon={faPen} /></button>
              )}
              {editId === e._id && (
                <>
                <input className={styles.reqBody} value={(editTitre)} onChange={(ev) => setEditTitre(ev.target.value)} />
                <button className={styles.btnValid} onClick={() =>updateRecette(e._id)}>Valider</button>
                </>
              )}


            <button 
              className={styles.btnDelete} 
              onClick={() => deleteRecette(e._id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            </>
            )}
          </div>
        ))}
    </div>
    </div>
  );
}

