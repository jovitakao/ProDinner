begin tran
delete c from chefs c
left join dinners d 
on d.chefid = c.id
where d.id is null
select * from chefs
rollback

begin tran
delete from dinners where id > 12
select top 20 * from dinners
rollback

begin tran
delete from dinnermeals
where dinnerid not in (select id from dinners)
select * from dinnermeals
rollback

begin tran
delete from meals where isdeleted = 1
and id not in (select mealid from dinnermeals)
rollback

begin tran
delete from countries where isdeleted = 1 and id not in
(select countryid from dinners)
and id not in
(select countryid from chefs)
rollback