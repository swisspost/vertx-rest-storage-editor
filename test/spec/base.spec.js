describe("check frameworks", function(){
    it ("Jquery", function() {
        expect($).toBeDefined();
    });
});

describe("check basic variables", function(){
    it ("baseUrl", function() {
        expect(baseUrl).toBeDefined();
    });
    it ("limitDefault", function() {
        expect(settings.limitDefault).toBeDefined();
    });
    it ("tree Object", function() {
        expect(tree).toBeDefined();
    });
    it ("nodes Array", function() {
        expect(nodes).toBeDefined();
    });
});

describe("check basic functions", function(){
    it ("loadTree - jsTree", function() {
        expect(loadTree).toBeDefined();
    });
    it ("parseJson - jsTree", function() {
        expect(parseJson).toBeDefined();
    });
    it ("changeFolderState - jsTree", function() {
        expect(changeFolderState).toBeDefined();
    });
});
