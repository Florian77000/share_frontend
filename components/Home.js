import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link'

export default function Home() {

  const [recette, setRecette] = useState ([])
  const [search, setSearch] = useState(""); //filtre par mot clé
  const [result, setResult] = useState([]); // afficher tout au départ
  const [filterType, setFilterType] = useState('')

  const typeOptions = [
  { value: "", label: "Choisir un type" },
  { value: "entrée", label: "entrée" },
  { value: "plat", label: "plat" },
  { value: "dessert", label: "dessert" },
];

  const [url, setUrl] = useState('')
  const [titre, setTitre] = useState('')
  const [type, setType] = useState ('')
  const [message, setMessage] = useState ('')

  const fetchRecette = () => {
    fetch('share-backend-omega.vercel.app/recette')
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
      fetch ('share-backend-omega.vercel.app/recette/add', {
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
          setMessage ('recette ajouté')
          fetchRecette()
        } else {
          setMessage ('erreur')
        }
      })
      setTitre('')
      setUrl('')
      setType('')
    }
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
            </div>
        ))}
    </div>
    </div>
  );
}

