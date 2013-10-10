OpenBadges on Google Sites
=======================

An implementation of OpenBadges for Google Sites. Based on http://mashe.hawksey.info/2012/12/open-badges-issuer-gadget-google-sites/

## Installation ##
1. First create a Google Form. This is where users go to request a badge.
2. Make 4 questions
    1. Name (Text question)
    1. Email (Text question)
    1. Badge (List question). Don't worry about the list items for this yet. This will be updated later. But this question will be where users select which badge they are requesting.
    1. Evidence (Text question)
3. Set the response destination to a New Spreadsheet.
4. Go to the spreadsheet and make a new sheet. This sheet should be titled <code>Badges</code>. This spreadsheet should have 4 columns.
    * Each row in this spreadsheet will be a badge that you're offering. DO NOT PUT HEADERS IN THIS SHEET.
    * The columns should be Badge Name, Badge Description, Badge Image, Badge Criteria. The last two columns should be links.
4. From the form, select **Tools** > **Script Editor**.
5. Paste the contents of [Code.gs](https://raw.github.com/bozakp/openbadges-google-sites/master/Code.gs) into the script editor.
6. Replace the FORM\_ID and SPREADSHEET\_ID with your own IDs (see [IDs below](#google-docs-ids)).
7. From the function dropdown, select <code>updateBadgeChoices</code>. Run this function.
    * This will update the choices in the form with the current list of badges that you have in the spreadsheet.
    * You will have to run this function every time you add or delete a badge.
7. Go to **Resources** > **Current project's triggers**
    * Set up a trigger to run the function "onFormSubmit", "From form", "on form submit"
8. Go to **File** > **Manage versions**
    * Save a new version of the file. The description isn't important.
9. Go to **Publish** > **Deploy as web app** and publish the version as a web app. It will give you a URL for the script. You will need this later.
10. Set the CLAIM\_URL\_BASE as the Google Sites page which will contain the claim gadget.
11. Go to that Google Sites page and add the claim gadget to it.
    1. **Insert** > **More gadgets...** > **Add gadget by URL** > http://hosting.gmodules.com/ig/gadgets/file/108150762089462716664/openbadges.xml
    2. Set the **Base URL** to the URL of your script (from above) followed by <code>?type=assert&claim_code=</code>

You should now be all set to start granting badges! You may have to authorize the script 
so that it can access all of the modules that it needs. To do this, go to the Script Editor and 
select the functions onFormSubmit and click the Run button. Do the same for the updateBadgeChoices function.


## Google Docs IDs ##
<pre>The ID can be found in the URL.
https://docs.google.com/spreadsheet/ccc?key=0AirK-4dEIsvKdDNjR3dtSm5BR0ZSel9XTWRQVXZmZ2c#gid=0
                                            ^               THIS IS THE ID             ^</pre>
                                            
## Known Limitations ##
**Simultaneous submissions**: The code will likely error if multiple people are submitting the form in a short 
interval of time (within a couple of seconds).
