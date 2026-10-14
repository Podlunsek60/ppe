use ppe;

-- Crée l'administrateur initial à partir du membre 1, s'il est déjà présent.
insert into administrateur (id)
select m.id
from membre m
where m.id = 1
  and not exists (
      select 1
      from administrateur a
      where a.id = m.id
  );

-- Réinitialise seulement les droits de l'administrateur initial.
delete from droit where idAdministrateur = 1;

-- Attribue à l'administrateur initial les droits des modules installés.
insert into droit (idAdministrateur, repertoire)
select a.id, f.repertoire
from administrateur a
cross join fonction f
where a.id = 1;

select * from droit;
