using System.Web;
using System.Web.Mvc;

using Omu.AwesomeMvc;
using Omu.ProDinner.Resources;

namespace Omu.ProDinner.WebUI.Helpers.Awesome
{
    /// <summary>
    /// modified version of CrudHelpers extenions copied from AwesomeMvcDemo
    /// </summary>
    public static class ProCrudHelpers
    {
        /*beging*/
        public static IHtmlString InitCrudPopupsForGrid<T>(this HtmlHelper<T> html, string gridId, string crudController, int createPopupHeight = 430, bool fullScreen = false)
        {
            var url = new UrlHelper(html.ViewContext.RequestContext);

            var result =
            html.Awe()
                .InitPopupForm()
                .Name("create" + gridId)
                .Group(gridId)
                .Height(createPopupHeight)
                .Fullscreen(fullScreen)
                .Url(url.Action("Create", crudController))
                .Success("utils.itemCreated('" + gridId + "')")
                .ToString()

            + html.Awe()
                  .InitPopupForm()
                  .Name("edit" + gridId)
                  .Group(gridId)
                  .Height(createPopupHeight)
                  .Fullscreen(fullScreen)
                  .Url(url.Action("Edit", crudController))
                  .Modal(true)
                  .Success("utils.itemEdited('" + gridId + "')")

            + html.Awe()
                  .InitPopupForm()
                  .Name("delete" + gridId)
                  .Group(gridId)
                  .Url(url.Action("Delete", crudController))
                  .Success("utils.itemDeleted('" + gridId + "')")
                  .OnLoad("utils.delConfirmLoad('" + gridId + "')")
                  .Parameter("gridId", gridId) // used to call grid.api.select and emphasize the row
                  .Height(200)
                  .Modal(true);

            return new MvcHtmlString(result);
        }
        /*endg*/

        public static IHtmlString InitCrudForGridNest<T>(this HtmlHelper<T> html, string gridId, string crudController)
        {
            var url = new UrlHelper(html.ViewContext.RequestContext);

            var result =
                html.Awe()
                    .InitPopupForm()
                    .Name("create" + gridId)
                    .Group(gridId)
                    .Url(url.Action("Create", crudController))
                    .Tag(new { Inline = true, NoTitle = true })
                    .Success("utils.itemCreated('" + gridId + "')")
                    .ToString()
                + html.Awe()
                      .InitPopupForm()
                      .Name("edit" + gridId)
                      .Group(gridId)
                      .Url(url.Action("Edit", crudController))
                      .Tag(new { Inline = true, NoTitle = true })
                      .Success("utils.itemEdited('" + gridId + "')")
                + html.Awe()
                      .InitPopupForm()
                      .Name("delete" + gridId)
                      .Group(gridId)
                      .Url(url.Action("Delete", crudController))
                      .Tag(new { Inline = true, NoTitle = true })
                      .Success("utils.itemDeleted('" + gridId + "')");

            return new MvcHtmlString(result);
        }

        /*beginal*/
        public static IHtmlString InitCrudPopupsForAjaxList<T>(
            this HtmlHelper<T> html, string ajaxListId, string controller, string key, string popupName, string afterUpdateFunc = null, bool fullScreen = false, int createPopupHeight = 430)
        {

            var editSuccessFunc = afterUpdateFunc == null
                          ? string.Format("utils.itemEditedAl('{0}', '{1}')", ajaxListId, key)
                          : string.Format("utils.itemEditedAl('{0}', '{1}', {2})", ajaxListId, key, afterUpdateFunc);

            var url = new UrlHelper(html.ViewContext.RequestContext);
            var result =
                html.Awe()
                    .InitPopupForm()
                    .Name("create" + popupName)
                    .Url(url.Action("Create", controller))
                    .Parameter("usingAjaxList", true)
                    .Height(createPopupHeight)
                    .Fullscreen(fullScreen)
                    .Success("utils.itemCreatedAlTbl('" + ajaxListId + "')")
                    .Group(ajaxListId)
                    .Title(Mui.Create)
                    .ToString()

                + html.Awe()
                      .InitPopupForm()
                      .Name("edit" + popupName)
                      .Url(url.Action("Edit", controller))
                      .Parameter("usingAjaxList", true)
                      .Height(createPopupHeight)
                      .Fullscreen(fullScreen)
                      .Success(editSuccessFunc)
                      .Group(ajaxListId)
                      .Title(Mui.Edit)

                + html.Awe()
                      .InitPopupForm()
                      .Name("delete" + popupName)
                      .Url(url.Action("Delete", controller))
                      .Success("utils.itemDeletedAl('" + ajaxListId + "', '" + key + "')")
                      .Group(ajaxListId)
                      .OkText(Mui.Yes)
                      .CancelText(Mui.No)
                      .Height(200)
                      .Title(Mui.Delete)

                + html.Awe()
                      .InitCall("restore" + popupName)
                      .Url(url.Action("Restore", controller))
                      .Success(editSuccessFunc);

            return new MvcHtmlString(result);
        }
        /*endal*/

        public static IHtmlString InitDeletePopupForGrid<T>(this HtmlHelper<T> html, string gridId, string crudController)
        {
            var url = new UrlHelper(html.ViewContext.RequestContext);

            var result =
                html.Awe()
                  .InitPopupForm()
                  .Name("delete" + gridId)
                  .Group(gridId)
                  .Url(url.Action("Delete", crudController))
                  .Success("utils.itemDeleted('" + gridId + "')")
                  .Parameter("gridId", gridId) // used to call grid.api.select and emphasize the row
                  .OnLoad("utils.delConfirmLoad('" + gridId + "')")
                  .Height(200)
                  .Modal(true)
                  .ToString();

            return new MvcHtmlString(result);
        }
    }
}