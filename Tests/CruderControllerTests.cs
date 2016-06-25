using FakeItEasy;
using NUnit.Framework;
using Omu.ProDinner.Core;
using Omu.ProDinner.Core.Model;
using Omu.ProDinner.Core.Service;
using Omu.ProDinner.WebUI.Mappers;
using Omu.ProDinner.WebUI.Controllers;
using Omu.ProDinner.WebUI.ViewModels.Input;

namespace Omu.ProDinner.Tests
{
    public class CruderControllerTests
    {
        CountryController countryController;

        [Fake]
        IProMapper mapper;

        [Fake]
        ICrudService<Country> countryCrudSrv;

        [SetUp]
        public void SetUp()
        {
            Fake.InitializeFixture(this);
            countryController = new CountryController(countryCrudSrv, mapper);
        }

        [Test]
        public void CreateShouldBuildNewInput()
        {
            countryController.Create();
            A.CallTo(() => mapper.Map<Country, CountryInput>(A<Country>.Ignored, null)).MustHaveHappened();
        }

        [Test]
        public void CreateShouldReturnViewForInvalidModelstate()
        {
            countryController.ModelState.AddModelError("", "");
            countryController.Create(A.Fake<CountryInput>(), null).ShouldBeViewResult();
        }

        [Test]
        public void EditShouldReturnCreateView()
        {
            A.CallTo(() => countryCrudSrv.Get(1)).Returns(A.Fake<Country>());
            countryController.Edit(1).ShouldBeViewResult().ShouldBeCreate();
            A.CallTo(() => countryCrudSrv.Get(1)).MustHaveHappened();
        }

        [Test]
        public void EditShouldReturnViewForInvalidModelstate()
        {
            countryController.ModelState.AddModelError("", "");
            countryController.Edit(A.Fake<CountryInput>(), null).ShouldBeViewResult().ShouldBeCreate();
        }

        [Test]
        public void EditShouldReturnContentOnError()
        {
            A.CallTo(() => mapper.Map<CountryInput, Country>(A<CountryInput>.Ignored, A<Country>.Ignored)).Throws(new ProDinnerException("aa"));
            countryController.Edit(A.Fake<CountryInput>(), null).ShouldBeContent().Content.ShouldEqual("aa");
        }

        [Test]
        public void DeleteShouldReturnView()
        {
            countryController.Delete(1, "").ShouldBeViewResult();
        }
    }
}
