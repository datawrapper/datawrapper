<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Populates data needed by the bookstore-cms unit tests.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 */
class CmsDataPopulator
{
    public static function populate($con = null)
    {
      if ($con === null) {
            $con = Propel::getConnection(PagePeer::DATABASE_NAME);
        }
        $con->beginTransaction();
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 1,194,'home')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 2,5,'school')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 6,43,'education')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 44,45,'simulator')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 46,47,'ac')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 3,4,'history')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 7,14,'master-mariner')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 8,9,'education')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 48,85,'courses')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 98,101,'contact')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 10,11,'entrance')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 104,191,'intra')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 102,103,'services')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 12,13,'competency')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 15,22,'watchkeeping-officer')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 16,17,'education')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 18,19,'entrance')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 20,21,'competency')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 31,38,'watchkeeping-engineer')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 32,33,'education')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 34,35,'entrance')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 36,37,'competency')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 39,40,'practice')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 86,97,'news')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 95,96,'2007-02')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 99,100,'personnel')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 87,88,'2007-06')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 49,50,'nautical')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 51,52,'radiotechnical')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 53,54,'resourcemgmt')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 57,58,'safety')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 59,60,'firstaid')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 61,62,'sar')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 67,84,'upcoming')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 65,66,'languages')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 55,56,'cargomgmt')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 119,120,'timetable')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 63,64,'boaters')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 105,118,'bulletinboard')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 106,107,'sdf')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 41,42,'fristaende')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 23,30,'ingenj')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 24,25,'utbildn')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 26,27,'ansokn')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 93,94,'utexaminerade')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 89,92,'Massan')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 192,193,'lankar')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 68,69,'FRB')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 70,71,'pelastautumis')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 72,73,'CCM')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 74,75,'sjukvard')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 121,188,'Veckoscheman')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 134,135,'VS3VSVsjukv')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 122,123,'sjoarb')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 130,131,'fysik1')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 140,141,'kemi')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 76,77,'inr')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 78,79,'forare')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 144,145,'AlexandraYH2')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 132,133,'AlexandraVS2')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 80,81,'Maskin')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 126,127,'forstahjalp')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 136,137,'Juridik')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 142,143,'mate')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 82,83,'basic')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 124,125,'mask')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 108,109,'magnus')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 138,139,'sjosakerhet')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 28,29,'pate')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 148,149,'eng')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 146,147,'forstahjalpYH1')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 110,111,'kortoverlevnadskurs')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 158,159,'kortoverlevnadskurs')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 128,129,'metall')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 152,153,'fysik')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 156,157,'fardplan')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 154,155,'astro')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 90,91,'utstallare')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 150,151,'eng')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 160,161,'ent')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 162,163,'juridik')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 168,169,'svenska')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 164,165,'matemat')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 166,167,'operativa')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 170,171,'plan')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 172,173,'src')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 112,113,'sjukv')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 174,175,'matemati')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 176,177,'fysiikka')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 114,115,'hantv')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 116,117,'CCM')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 178,179,'haveri')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 180,181,'FRB')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 182,183,'kemia')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 184,185,'vaktrutiner')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 189,190,'laroplan')");
        $con->exec("INSERT INTO Page (ScopeId, LeftChild, RightChild, Title) VALUES (1, 186,187,'SSOkurs')");

        $con->exec("INSERT INTO Category (LeftChild, RightChild, Title) VALUES (1, 8, 'Cat_1')");
        $con->exec("INSERT INTO Category (LeftChild, RightChild, Title) VALUES (2, 7, 'Cat_1_1')");
        $con->exec("INSERT INTO Category (LeftChild, RightChild, Title) VALUES (3, 6, 'Cat_1_1_1')");
        $con->exec("INSERT INTO Category (LeftChild, RightChild, Title) VALUES (4, 5, 'Cat_1_1_1_1')");

        $con->commit();
    }

    public static function depopulate($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(PagePeer::DATABASE_NAME);
        }
        $con->beginTransaction();
        $con->exec("DELETE FROM Page");
        $con->exec("DELETE FROM Category");

        $con->commit();
    }
}
