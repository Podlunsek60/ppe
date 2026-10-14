use ppe;

-- Crée l'administrateur initial après l'insertion du membre 1.
-- Les autres administrateurs et leurs droits sont conservés.
insert into administrateur (id)
select m.id
from membre m
where m.id = 1
  and not exists (
      select 1
      from administrateur a
      where a.id = m.id
  );
